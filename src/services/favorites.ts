let server = localStorage.getItem('server') || '';
let accessToken = localStorage.getItem('accessToken') || '';

export const getFavorites = async () => {
    const response = await fetch(`https://mammoth-server-node-qsqckaz7va-uc.a.run.app/favorites?code=${accessToken}&server=${server}`);
    const data = await response.json();
    return data;
};