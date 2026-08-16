export function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === "") {
        return "₹ TBD";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(amount));
}
