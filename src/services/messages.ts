export const getMessages = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/messages');
    const data = await response.json();
    return data;
}