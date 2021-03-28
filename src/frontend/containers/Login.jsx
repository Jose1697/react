import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import googleIcon from '../assets/static/google-icon.png';
import twitterIcon from '../assets/static/twitter-icon.png';
import '../assets/styles/components/Login.scss';
import { loginRequest } from '../actions';
import Header from '../components/Header';

const Login = (props) => {

  const [form, setValues] = useState({
    email: '',
  });

  const handleInput = (event) => {
    setValues({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    props.loginRequest(form);
    props.history.push('/');

  };

  return (
    <>
      <Header isLogin />
      <section className='login'>
        <div className='login__container'>

          <h2 className='title'>Inicia Sesión</h2>

          <form className='login__container--form' onSubmit={handleSubmit}>
            <input
              name='email'
              className='input'
              type='text'
              placeholder='Correo'
              onChange={handleInput}
            />

            <input
              email='password'
              className='input'
              type='password'
              placeholder='Contraseña'
              onChange={handleInput}
            />
            <button className='button' type='button'>Iniciar sesión</button>
            <div className='login__container--remember'>
              <label htmlFor='cbox1'>
                <input type='checkbox' name='' id='cbox1' value='checkbox' />
                Recuérdame
              </label>
              <a href='/'>Olvidé mi contraseña</a>
            </div>
          </form>

          <div className='login__container--social'>
            <div>
              <img src={googleIcon} alt='Google' />
              Inicia sesión con Google
            </div>

            <div>
              <img src={twitterIcon} alt='Google' />
              Inicia sesión con Twiter
            </div>

          </div>

          <p className='login__container--register mr-3'>
            No tienes ninguna cuenta, &thinsp;
            <Link to='/register'>
              Registrate
            </Link>

          </p>
        </div>

      </section>
    </>
  );
};

// export default Login

const mapDispatchToProps = {
  loginRequest,
};
export default connect(null, mapDispatchToProps)(Login);
