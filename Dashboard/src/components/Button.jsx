export default function Button({ text, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full rounded-xl bg-blue-600 py-2  font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
    >
      {text}
    </button>
  );
}
