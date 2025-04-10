import React, { useState } from "react";

const getPageNumbers = (current, total) => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

export default function PaginationWithEllipsis({ totalPages, onPageChange }) {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    onPageChange && onPageChange(page);
  };

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="tw:flex tw:items-center tw:justify-start tw:space-x-2 tw:mt-4 tw:gap-2">
      <button
        className="tw:px-3 tw:py-1 tw:rounded-lg tw:border tw:bg-white tw:shadow-sm tw:disabled:opacity-50"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => handlePageChange(page)}
            className={`tw:text-5xl tw:px-3 tw:py-1 tw:rounded-lg tw:border tw:shadow-sm ${
              page === currentPage
                ? "tw:bg-[#eef] tw:text-white "
                : "tw:bg-white tw:hover:bg-gray-100"
            }`}
          >
            {page} 
          </button> 
        ) : (
          <span key={index} className="tw:px-2 tw:py-1 tw:text-gray-500">
            {page}
          </span>
        )
      )}

      <button
        className="tw:px-3 tw:py-1 tw:rounded-lg tw:border tw:bg-white tw:shadow-sm tw:disabled:opacity-50"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
} 

// Usage Example
// <PaginationWithEllipsis totalPages={100} onPageChange={(page) => console.log(page)} />
