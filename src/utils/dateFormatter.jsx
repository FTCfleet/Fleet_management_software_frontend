export const dateFormatter = (dateString) => {
    if (!dateString) return "N/A"; 
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Convert UTC to IST (Asia/Kolkata timezone)
    const options = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(date);
    
    // Extract parts
    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod').value.toLowerCase();
    
    return `${day}/${month}/${year}, ${hour}:${minute} ${dayPeriod}`;
};

export const dateFormatterForThermal = (dateString) => {
    if (!dateString) return "N/A"; 
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Convert UTC to IST (Asia/Kolkata timezone)
    const options = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(date);
    
    // Extract parts
    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod').value.toLowerCase();
    
    return `${day}/${month}/${year}, ${hour}:${minute} ${dayPeriod}`;
};


export const getDate = () => {
    const date = new Date();
    const day =  date.getDate().toString().padStart(2, '0');
    const month =  new Date().getMonth();
    const year =  new Date().getFullYear();
    return `${year}-${(month+1).toString().padStart(2, '0')}-${day}`;
};
