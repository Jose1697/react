import React from 'react';
import '../assets/styles/components/NotFound.scss';

const NotFound = () => (
    // Similar a React.Fragment
    <>   
        <section className="not-found">
        <h1 className="not-found__title">404</h1>
        <h3 className="not-found__description">Página no encontrada</h3>
        </section>
    </>
    

);

export default NotFound;