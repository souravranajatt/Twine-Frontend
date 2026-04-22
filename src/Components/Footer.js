import '../Assets/Bundle/Footer.css';
import {Link} from 'react-router-dom';

function Footer() {
    const currentYear = new Date().getFullYear();
    return(
        <footer className="footer-wrapper">
            <div className="link-div">
                <span className='link-tag'><Link className='link-style'>Policies</Link></span>
                <span className='link-tag'><Link className='link-style'>About</Link></span>
                <span className='link-tag'><Link className='link-style'>Support</Link></span>
                <span className='link-tag'><Link className='link-style'>Community</Link></span>
            </div>
            <div className="company-reserved">
                <p className='company-copyright-tag'>© {currentYear} Twine</p>
            </div>
        </footer>
    );
}

export default Footer;