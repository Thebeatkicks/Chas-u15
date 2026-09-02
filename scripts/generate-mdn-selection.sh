#!/usr/bin/env bash
# Genererar urvalslistan för issue #5 (MDN-urval för RAG v1) ur en grund klon
# av mdn/content. Körs INTE i CI — körs manuellt lokalt när urvalet behöver
# regenereras (t.ex. om MDN-strukturen ändras eller urvalskriterierna justeras).
#
# OBS för #6 (embedding-spiken): den här listan är källan för vilka filer som
# ska hämtas, chunkas och embeddas. Ändra gärna hämtningslogik i ett eget
# script i den här mappen, men håll den här filen (kriterierna) som facit —
# uppdatera scripts/mdn-selection-list.txt via detta script, inte för hand.
#
# Användning:
#   git clone --depth 1 --filter=blob:none --sparse https://github.com/mdn/content /path/to/content
#   cd /path/to/content && git sparse-checkout set files/en-us/web/javascript files/en-us/web/api
#   MDN_CONTENT_DIR=/path/to/content ./scripts/generate-mdn-selection.sh
#
# Output: scripts/mdn-selection-list.txt (en relativ sökväg per rad, sorterad)

set -euo pipefail

MDN_CONTENT_DIR="${MDN_CONTENT_DIR:?Sätt MDN_CONTENT_DIR till sökvägen för din mdn/content-klon}"
JS_ROOT="files/en-us/web/javascript"
API_ROOT="files/en-us/web/api"
OUT_FILE="$(dirname "$0")/mdn-selection-list.txt"

cd "$MDN_CONTENT_DIR"

if [ ! -d "$JS_ROOT" ]; then
  echo "Hittar inte $JS_ROOT under $MDN_CONTENT_DIR — kör sparse-checkout set $JS_ROOT $API_ROOT först." >&2
  exit 1
fi

tmp="$(mktemp)"

# --- 1. JavaScript Guide: allt (konceptuell kärntext, ~30 sidor) ---
find "$JS_ROOT/guide" -name "index.md" >> "$tmp"

# --- 2. Referens, mindre kategorier: allt ---
for d in classes execution_model functions iteration_protocols \
         javascript_technologies_overview lexical_grammar regular_expressions \
         statements strict_mode template_literals trailing_commas operators; do
  find "$JS_ROOT/reference/$d" -name "index.md" >> "$tmp" 2>/dev/null || true
done
[ -f "$JS_ROOT/reference/index.md" ] && echo "$JS_ROOT/reference/index.md" >> "$tmp"

# --- 3. global_objects: kärnobjekt (fullt urval av deras metod-sidor) ---
CORE_OBJECTS="array object string number boolean math json date regexp map set \
  promise function error typeerror rangeerror referenceerror syntaxerror \
  globalthis nan infinity undefined"

for obj in $CORE_OBJECTS; do
  find "$JS_ROOT/reference/global_objects/$obj" -name "index.md" 2>/dev/null
done >> "$tmp"

# Exkludera inom kärnobjekten: föråldrade/legacy, HTML-wrapper-metoder,
# UTC-dubbletter och locale-varianter (se docs/mdn-selection.md "Uteslutet").
grep -viE "/(getyear|setyear|anchor|big|blink|bold|fixed|fontcolor|fontsize|italics|link|small|strike|sub|sup)/index\.md$" "$tmp" \
  | grep -viE "/(getutc[a-z]+|setutc[a-z]+)/index\.md$" \
  | grep -viE "/tolocale[a-z]*string/index\.md$" \
  | grep -viE "/localecompare/index\.md$" \
  > "${tmp}.filtered"
mv "${tmp}.filtered" "$tmp"

# Math: bara vanliga metoder, inte hyperbolisk/bitwise-nisch
grep -viE "/math/(acosh|asinh|atanh|cbrt|clz32|cosh|sinh|tanh|expm1|f16round|fround|hypot|imul|ln10|ln2|log10|log10e|log1p|log2|log2e|sqrt1_2|sqrt2|sumprecise)/index\.md$" "$tmp" > "${tmp}.filtered"
mv "${tmp}.filtered" "$tmp"

# Symbol: bara de vanligaste (overview, iterator, for, keyFor, toString, description)
grep -vE "/symbol/(asyncdispose|asynciterator|dispose|hasinstance|isconcatspreadable|match|matchall|replace|search|species|split|symbol\.toprimitive|toprimitive|tostringtag|unscopables|valueof)/index\.md$" "$tmp" > "${tmp}.filtered"
mv "${tmp}.filtered" "$tmp"

# Ytterligare nischträff: bitwise-operatorer, sammansatta tilldelningsoperatorer
# (+= etc. — grundoperatorn räcker för att förklara mönstret), föråldrade
# Object-dunder-accessorer, RegExp:s well-known-symbol-metoder + deprecated
# compile(), nya (ES2023/2024) Array/Set-metoder och Function/Promise-nischer.
# (generator/generatorfunction/asyncfunction/bigint hanteras separat nedan —
# bara deras overview-sida tas med, inte alla delmetoder.)
grep -vE "/operators/(bitwise_(and|or|xor|not)|left_shift|right_shift|unsigned_right_shift|[a-z_]+_assignment)/index\.md$" "$tmp" \
  | grep -vE "/global_objects/object/(__defineGetter__|__defineSetter__|__lookupGetter__|__lookupSetter__|__proto__)/index\.md$" \
  | grep -vE "/global_objects/regexp/(compile|symbol\.[a-z]+)/index\.md$" \
  | grep -vE "/global_objects/array/(toreversed|tosorted|tospliced|with)/index\.md$" \
  | grep -vE "/global_objects/set/(union|intersection|difference|symmetricdifference|issubsetof|issupersetof|isdisjointfrom)/index\.md$" \
  | grep -vE "/global_objects/promise/withresolvers/index\.md$" \
  | grep -vE "/global_objects/function/(caller|displayname)/index\.md$" \
  > "${tmp}.filtered"
mv "${tmp}.filtered" "$tmp"

# --- 4. global_objects: nischade objekt, bara overview-sidan (inte metoder) ---
# weakmap/weakset/iterator/proxy/symbol/generatorfunction/asyncfunction/bigint
# har overview under <obj>/<obj>/index.md; reflect och generator (inget
# konstruktoranrop i praktiken) har sin overview direkt på <obj>/index.md.
for obj in weakmap weakset iterator proxy symbol generatorfunction asyncfunction bigint; do
  find "$JS_ROOT/reference/global_objects/$obj/$obj" -maxdepth 1 -name "index.md" 2>/dev/null
done >> "$tmp"
for obj in reflect generator; do
  [ -f "$JS_ROOT/reference/global_objects/$obj/index.md" ] && \
    echo "$JS_ROOT/reference/global_objects/$obj/index.md" >> "$tmp"
done

# --- 5. Globala funktioner (encodeURIComponent, isNaN, parseInt, m.fl.) ---
for fn in decodeuri decodeuricomponent encodeuri encodeuricomponent eval isfinite isnan parsefloat parseint; do
  find "$JS_ROOT/reference/global_objects/$fn" -maxdepth 1 -name "index.md" 2>/dev/null
done >> "$tmp"

# --- 6. DOM + fetch (web/api): kärnsidor för att kunna förklara DOM-manipulation ---
if [ -d "$API_ROOT" ]; then
  DOM_FETCH_PAGES="
    document/index.md
    element/index.md
    eventtarget/index.md
    event/index.md
    node/index.md
    nodelist/index.md
    htmlelement/index.md
    window/index.md
    console/index.md
    fetch/index.md
    response/index.md
    request/index.md
    headers/index.md
    formdata/index.md
    url/index.md
    urlsearchparams/index.md
    storage/index.md
    document/queryselector/index.md
    document/queryselectorall/index.md
    document/getelementbyid/index.md
    document/createelement/index.md
    eventtarget/addeventlistener/index.md
    eventtarget/removeeventlistener/index.md
    element/classlist/index.md
    element/innerhtml/index.md
    node/appendchild/index.md
    node/removechild/index.md
    node/textcontent/index.md
    window/fetch/index.md
    window/localstorage/index.md
    window/sessionstorage/index.md
    window/settimeout/index.md
    window/setinterval/index.md
    fetch_api/index.md
    fetch_api/using_fetch/index.md
  "
  for p in $DOM_FETCH_PAGES; do
    f="$API_ROOT/$p"
    [ -f "$f" ] && echo "$f" >> "$tmp"
  done
fi

sort -u "$tmp" > "$OUT_FILE"
rm -f "$tmp"

echo "Skrev $(wc -l < "$OUT_FILE") sidor till $OUT_FILE"
