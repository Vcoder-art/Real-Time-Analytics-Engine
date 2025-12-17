function SelectAppPlaceholder() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
          📊
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white mb-2">
          No App Selected
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed">
          Please select an app to view analytics, insights, and real-time statistics.
        </p>
      </div>
    </div>
  );
}

export default SelectAppPlaceholder;
