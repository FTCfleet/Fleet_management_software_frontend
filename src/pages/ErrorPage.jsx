import {React} from "react"
import { Helmet } from "react-helmet-async";

export default function ErrorPage(){
    return (
        <>
            <Helmet>
                <title>Page Not Found | Friends Transport Company Hyderabad</title>
                <meta
                    name="description"
                    content="The page you are looking for does not exist. Visit Friends Transport Company for parcel delivery, truck booking and logistics services in Hyderabad, Telangana."
                />
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <div className="app">
                <p>Page not Found</p>
            </div>
        </>
    );
}