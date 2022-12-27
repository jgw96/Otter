export const getCurrentUser = async () => {
    const response = await fetch('https://mammoth-server.azurewebsites.net/user');
    const data = await response.json();
    return data;
}

export const getAccount = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/account?id=${id}`);
    const data = await response.json();
    return data;
};

export const getUsersPosts = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/userPosts?id=${id}`);
    const data = await response.json();
    return data;
}

export const getUsersFollowers = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/followers?id=${id}`);
    const data = await response.json();
    return data;
}

export const followUser = async (id: string) => {
    const response = await fetch(`https://mammoth-server.azurewebsites.net/follow?id=${id}`);
    const data = await response.json();
    return data;
}

export const getInstanceInfo = async () => {
    const response = await fetch('http://localhost:8080/instance');
    const data = await response.json();
    return data;
}