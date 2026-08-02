const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-gray-400">
      © {new Date().getFullYear()} WhiteBoard. Built with React, TypeScript &
      Socket.IO.
    </footer>
  );
};

export default Footer;