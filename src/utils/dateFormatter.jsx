export const dateFormatter = (dateString) => {
    if (!dateString) return "N/A"; 
    const year = dateString.substring(0, 4);
    const month = dateString.substring(5, 7);
    const day = dateString.substring(8, 10);
    const hour24 = parseInt(dateString.substring(11, 13));
    const minute = dateString.substring(14, 16);

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