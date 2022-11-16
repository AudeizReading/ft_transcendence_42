function Auth() {
  localStorage.setItem('bearer', window.location.hash.replace('#bearer=', ''));
  let html = '';

  try {
    window.opener.window.wOpen = window;
    window.opener.window.dispatchEvent(new Event('auth_success'));
  } catch (e) {
    console.warn('je suis triste mais auth!');
  }

  return (
    <div>
      Connexion OK. Vous pouvez fermer cette page :) {html}
    </div>
  );
}
export default Auth;