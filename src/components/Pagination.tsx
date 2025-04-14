interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: PaginationProps) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className="bg-secondary hover:bg-blue-700 text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Previous
      </button>

      <div className="px-4 py-2 bg-white rounded-lg shadow-inner text-sm font-medium">
        Page <span className="font-bold text-secondary">{currentPage}</span> of{" "}
        <span className="font-bold text-secondary">{totalPages}</span>
      </div>

      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className="bg-secondary hover:bg-blue-700 text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center"
      >
        Next
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
