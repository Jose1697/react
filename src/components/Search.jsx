import React from 'react';
import classNames from 'classnames'
import '../assets/styles/components/Search.scss';
const Search = (props) => {
    const { isHome } = props
    const inputStyle = classNames('inputt', {
        isHome
    })
    return(
        <section className="main">
            <h2 className="main__title">¿Qué quieres ver hoy?</h2>
            <input className={inputStyle} type="text" placeholder="Buscar..."/>
        </section>
    );
}

export default Search;
