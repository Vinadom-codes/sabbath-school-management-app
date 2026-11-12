import Header from "./Header"

const Main = ({ onMenuClick }) => {
  return (
    <main id="main" >
      <Header onMenuClick={onMenuClick} />
    </main>
  );
};

export default Main

