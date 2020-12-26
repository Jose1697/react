import {useState, useEffect} from 'react'

const useInitialState = (API) => {
    //useState
    const [ videos, setVideos ] = useState({ mylist: [], trends: [], originals: [] });
    
    //useEffect
    useEffect(() => {
        fetch(API)
            .then(response => response.json())
            .then(data => setVideos(data));
    }, []);

    return videos;

};

export default useInitialState;