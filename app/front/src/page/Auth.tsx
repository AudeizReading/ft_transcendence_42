import React, { useState, useEffect } from 'react';

function Auth() {
  const [html, setHtml] = useState('');

  useEffect(() => { // will be run twice ^^'
    localStorage.setItem('bearer', window.location.hash.replace('#bearer=', ''));

    try {
      window.opener.window.wOpen = window;
      window.opener.window.dispatchEvent(new Event('auth_success'));
    } catch (e) {
      console.warn('je suis triste mais auth!');
      setHtml(' *');
    }
  },[]);

  return (
    <div>
      Connexion OK. Vous pouvez fermer cette page :) {html}
    </div>
  );
}
export default Auth;