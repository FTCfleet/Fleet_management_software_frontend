export const dateFormatter = (dateString) => {
    if (!dateString) return "N/A"; 
    
    // Parse the date string
    // NOTE: Backend stores IST time but sends it as if it's UTC
    // So we should NOT convert - just format it directly
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Format directly without timezone conversion
    // The date is already in IST from backend
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    
    return `${day}/${month}/${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export const dateFormatterForThermal = (dateString) => {
    if (!dateString) return "N/A"; 
    
    // Parse the date string
    // NOTE: Backend stores IST time but sends it as if it's UTC
    // So we should NOT convert - just format it directly
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Format directly without timezone conversion
    // The date is already in IST from backend
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    
    return `${day}/${month}/${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};


export const getDate = () => {
    const date = new Date();
    const day =  date.getDate().toString().padStart(2, '0');
    const month =  new Date().getMonth();
    const year =  new Date().getFullYear();
    return `${year}-${(month+1).toString().padStart(2, '0')}-${day}`;
};
