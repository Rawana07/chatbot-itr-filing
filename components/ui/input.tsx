export function Input({ type = 'text', ...props }: any) {
  return (
    <input
      type={type}
      className="border rounded w-full px-3 py-2"
      {...props}
    />
  );
}
