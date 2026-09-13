interface LayerItemProps {
  toggle: boolean;
  onCheck: () => void;
  id: string;
  label: string;
}

export default function LayerItem({ onCheck, toggle, id, label}: LayerItemProps) {
  return (
    <div className="flex w-full gap-2">
      <input
        type="checkbox"
        id={id}
        name={id}
        className="border border-(--color-secondary) cursor-pointer"
        checked={toggle}
        onChange={onCheck}
      />
      <label htmlFor={id} className="font-sans text-sm font-extralight">{label}</label>
    </div>
  );
}