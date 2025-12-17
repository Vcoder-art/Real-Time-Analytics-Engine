import Header from "../components/Header";

function ProtectedLayout({ children }) {
    return <>
        <Header />
        {children}
    </>
}

export default ProtectedLayout;