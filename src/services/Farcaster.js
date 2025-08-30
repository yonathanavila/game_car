import { useSignIn, QRCode } from '@farcaster/auth-kit';

function App() {
    const {
        signIn,
        url,
        data: { username },
    } = useSignIn({
        onSuccess: ({ fid }) => console.log('Your fid:', fid),
    });

    return (
        <div>
            <button onClick={signIn}>Sign In</button>
            {url && (
                <span>
                    Scan this: <QRCode uri={url} />
                </span>
            )}
            {username && `Hello, ${username}!`}
        </div>
    );
}