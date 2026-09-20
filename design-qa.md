# Design QA — HR AgroRiego

## Evidence

- Source visual truth: `design/source-option-1.png`
- Browser-rendered implementation: `design/implementation-summary.jpg`
- Full-view comparison: `design/qa-comparison.jpg`
- Focused metrics/sector comparison: `design/qa-focus-comparison.jpg`
- Source pixels: 1487 × 1058.
- Implementation screenshot pixels: 1348 × 926.
- Browser CSS viewport: 1363 × 936 at device density 1.
- Normalization: both full views were scaled into equal 700 × 500 comparison cells; focused content regions were normalized to 900 × 480.
- State: dark theme, `#resumen`, initial demonstration data, no open menu or toast.

## Findings

No actionable P0, P1, or P2 differences remain.

- Typography: Inter 400/500/600/700 is bundled locally. The hierarchy, weights, line heights, and compact metric labels reproduce the selected source without clipped text.
- Spacing and layout: the fixed sidebar, top bar, five-metric row, four-sector row, warning strip, and two lower panels preserve the source hierarchy. At the narrower verification viewport, the disclosure chip hides responsively and the date uses two compact lines.
- Colors and tokens: deep green surfaces, subtle green borders, teal/blue information accents, amber warning, and high-contrast foregrounds match the reference intent.
- Image and icon fidelity: the design contains no raster imagery. All visible symbols use one consistent Tabler outline icon family; no emoji, handcrafted SVG, CSS illustration, or placeholder asset is used.
- Copy and content: the interface preserves the selected visual language while changing `4,2 mm · Externo real` to `Sin dato · Externo faltante` until the external source supplies a validated value. This is an intentional data-integrity constraint.
- Responsive behavior: there is no horizontal overflow at 1363 px. CSS breakpoints reorganize metrics, sectors, lower panels, forms, and the sidebar for tablet and mobile widths.
- Accessibility: semantic headings, buttons, navigation, labels, focus outlines, readable contrast, reduced-motion handling, and minimum mobile control sizes are present.

## Interaction Verification

- `Actualizar datos`: passed; updates only simulated readings and shows confirmation.
- `Historial`: passed; navigation, sector/period filters, and responsive chart render.
- `Riego`: passed; local manual record form submits and confirms without activating hardware.
- `Dispositivos y configuración`: passed; view renders and local-save confirmation appears.
- Final route restored to `#resumen` and kept open in the cloud browser.
- Browser console checked: no application errors. The only reported messages came from the cloud-browser extension metadata channel and do not originate in HR AgroRiego.

## Comparison History

### Iteration 1

- Earlier finding [P2]: the header disclosure and long localized date produced horizontal overflow at the verification width; the fifth metric also stretched the entire metrics row vertically.
- Fix: hide the disclosure below 1400 px, use a compact `dd mmm yyyy · HH:mm` date, allow safe value wrapping, and apply a smaller optical size to the update value.
- Post-fix evidence: `design/implementation-summary.jpg`, `design/qa-comparison.jpg`, and `design/qa-focus-comparison.jpg` show no horizontal overflow, no clipped control, and restored density.

## Follow-up Polish

- [P3] The free outline leaf icon differs slightly from the generated brand mark but retains the intended scale, weight, color, and agricultural meaning.
- [P3] At widths below 1400 px, the global provenance disclosure is hidden from the header to preserve the layout; provenance remains visible on every relevant value.

## Implementation Checklist

- [x] Match selected summary composition.
- [x] Keep all data provenance visible and truthful.
- [x] Implement all four requested views.
- [x] Verify primary local interactions.
- [x] Remove horizontal overflow.
- [x] Build successfully for the prepared static runtime.

final result: passed
