import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {ChakraProvider} from '@chakra-ui/react';

import theme from './theme';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import CameraPage from './pages/CameraPage';
import ProfilePage from './pages/ProfilePage';
import FollowersPage from './pages/FollowersPage';
import DiscoverPage from './pages/DiscoverPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import NFTMarketplacePage from './pages/NFTMarketplacePage';
import MyNFTsPage from './pages/MyNFTsPage';
import {WalletProvider} from "./providers/WalletProvider";
import {LensAuthProvider} from "./providers/LensAuthProvider";
import SignUpPage from "./pages/SignUpPage";
import PostPage from './pages/PostPage';
import AIAssistantPage from './pages/AIAssistantPage'; // Import the AI Assistant page

function App() {
    return (
        <WalletProvider>
            <LensAuthProvider>
                <ChakraProvider theme={theme}>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<SignInPage/>}/>
                            <Route path="/signup" element={<SignUpPage/>}/>
                            <Route path="/" element={<Layout/>}>
                                <Route index element={<HomePage/>}/>
                                <Route path="camera" element={<CameraPage/>}/>
                                <Route path="profile/:name" element={<ProfilePage/>}/>
                                <Route path="profile/:name/followers" element={<FollowersPage/>}/>
                                <Route path="discover" element={<DiscoverPage/>}/>
                                <Route path="messages" element={<MessagesPage/>}/>
                                <Route path="notifications" element={<NotificationsPage/>}/>
                                <Route path="nft/marketplace" element={<NFTMarketplacePage/>}/>
                                <Route path="nft/my-nfts" element={<MyNFTsPage/>}/>
                                <Route path="post/:postId" element={<PostPage />} />
                                <Route path="ai-assistant" element={<AIAssistantPage />} /> {/* Add the AI Assistant route */}
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </Router>
                </ChakraProvider>
            </LensAuthProvider>
        </WalletProvider>
    );
}

export default App;