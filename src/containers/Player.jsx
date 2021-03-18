import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import {getVideoSource} from '../actions/index'
import '../assets/styles/components/Player.scss'
import { Redirect } from 'react-router'
import NotFound from './NotFound'

const Player = props => {
    const { id } = props.match.params;
    const hasPlaying = Object.keys(props.playing).length > 0;

    useEffect(() => {
        props.getVideoSource(id)   
    }, [])

    return hasPlaying ?(
        <div className="Player">
            <video controls autoPlay>
                <source src={props.playing.source} type="video/mp4"/>
            </video>
            <div className="Player-back">
                <button type="button" onClick={() => props.history.goBack()}>
                    Regresar
                </button>
            </div>
        </div>


    ):  setTimeout(() => { <NotFound/> }, 2000 )  

}

// export default Player

const mapStateToProps = state => {
    return{
        playing: state.playing
    }
}


const mapDispatchToProps = {
    getVideoSource,
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)