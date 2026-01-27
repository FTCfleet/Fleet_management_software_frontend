export const dateFormatter = (dateString) => {
    if (!dateString) return "N/A"; 
    
    // Parse the date string and convert to IST
    const date = new Date(dateString);
    
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(date.getTime() + istOffset);
    
    const year = istDate.getUTCFullYear();
    const month = (istDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = istDate.getUTCDate().toString().padStart(2, '0');
    const hour24 = istDate.getUTCHours();
    const minute = istDate.getUTCMinutes().toString().padStart(2, '0');

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
