export const dateFormatter = (dateString) => {
    if (!dateString) return "N/A"; 
    
    // Parse the date string (backend sends UTC)
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Convert UTC to IST (Asia/Kolkata timezone)
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    
    const formattedDate = date.toLocaleString('en-IN', options);
    
    // Format: "07/02/2026, 07:49 PM" (DD/MM/YYYY, HH:MM AM/PM)
    return formattedDate;
};


export const getDate = () => {
    const date = new Date();
    const day =  date.getDate().toString().padStart(2, '0');
    const month =  new Date().getMonth();
    const year =  new Date().getFullYear();
    return `${year}-${(month+1).toString().padStart(2, '0')}-${day}`;
};
