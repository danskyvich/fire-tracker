export function UncontainedPoint() {
  return (
    <div className="w-2.5 h-2.5 bg-(--color-uncontained-fill) border border-(--color-uncontained-stroke) rounded-[50%]" />
  );
}
export function PartialContainedPoint() {
  return (
    <div className="w-2.5 h-2.5 bg-(--color-partial-fill) border border-(--color-partial-stroke) rounded-[50%]" />
  );
}
export function ContainedPoint() {
  return (
    <div className="w-2.5 h-2.5 bg-(--color-contained-fill) border border-(--color-contained-stroke) rounded-[50%]" />
  );
}
export function ControlledPoint() {
  return (
    <div className="w-2.5 h-2.5 bg-(--color-good) border border-(--color-good) rounded-[50%]" />
  );
}
export function ShallowPoint({className}: {className: string}) {
  return (
    <div className={`${className} bg-[#989898]/33 border border-white rounded-[50%]`} />
  );
}