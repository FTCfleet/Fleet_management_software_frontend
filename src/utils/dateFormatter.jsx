export const dateFormatter = (dateString) => {
    if (!dateString) return "N/A"; 
    
    // Parse the date string
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Subtract IST offset (5.5 hours) to get the actual IST time
    // This is needed because backend stores IST time as if it were UTC
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const correctedDate = new Date(date.getTime() - istOffset);
    
    const year = correctedDate.getFullYear();
    const month = (correctedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = correctedDate.getDate().toString().padStart(2, '0');
    const hour24 = correctedDate.getHours();
    const minute = correctedDate.getMinutes().toString().padStart(2, '0');

    let ampm = hour24 >= 12 ? 'PM' : 'AM';
    let hour12 = (hour24 % 12 || 12).toString().padStart(2,'0'); 

    const formattedDate = `${day}/${month}/${year}, ${hour12}:${minute} ${ampm}`;
    return (formattedDate); 
};


export const getDate = () => {
    const date = new Date();
    const day =  date.getDate().toString().padStart(2, '0');
    const month =  new Date().getMonth();
    const year =  new Date().getFullYear();
    return `${year}-${(month+1).toString().padStart(2, '0')}-${day}`;
};
