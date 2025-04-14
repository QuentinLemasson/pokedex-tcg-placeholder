// Simple PDF export utility that uses the browser's print functionality
export const exportToPdf = () => {
  // Hide elements that should not be printed
  const originalTitle = document.title;
  document.title = "Pokemon TCG Cards";

  // Trigger print dialog
  window.print();

  // Restore title
  document.title = originalTitle;
};
