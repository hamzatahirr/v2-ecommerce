"use client";

const useFormatPrice = () => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return formatPrice;
};

export default useFormatPrice;
