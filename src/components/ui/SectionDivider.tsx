/**
 * Data-stream divider between landing sections: a hairline with light pulses
 * traveling along it (see .stream-divider in globals.css -- pure CSS, so the
 * global reduced-motion rule disables the pulses with no JS involved).
 * Server component on purpose: no state, no effects, nothing client-side.
 */
export function SectionDivider() {
  return (
    <div aria-hidden="true" className="max-w-6xl mx-auto px-4">
      <div className="stream-divider" />
    </div>
  );
}
