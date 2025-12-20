export default function MailSidebar({ active, onChange }) {


  const item = (key, label) => {
    return <button
      onClick={() => onChange(key)}
      className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition
        ${active === key ? "bg-blue-600" : "hover:bg-gray-800"}
      `}
    >
      {label}
    </button>
  }


  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Mail</h2>
      {item("inbox", "Inbox")}
      {item("sent", "Sent")}

    </>
  );
}
