export default function Button({ text, onClick, type = "button", className }) {

  const updatedClassName = "w-full rounded-xl bg-blue-600 py-2  font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all" + className;

  return (
    <button
      type={type}
      onClick={onClick}
      style={{color:"black"}}
      className={updatedClassName}
    >
      {text}
    </button>
  );
}
