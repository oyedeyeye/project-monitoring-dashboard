
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h1 className="text-4xl font-bold text-red-600 mb-2">403 - Unauthorized</h1>
            <p className="text-gray-600 mb-6 text-center">You do not have permission to access requested page.</p>
            <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
                Go Back
            </button>
        </div>
    );
};

export default Unauthorized;
