import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {ChakraProvider} from '@chakra-ui/react';

import theme from './theme';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CameraPage from './pages/CameraPage';
import ProfilePage from './pages/ProfilePage';
import FollowersPage from './pages/FollowersPage';
import DiscoverPage from './pages/DiscoverPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import NFTMarketplacePage from './pages/NFTMarketplacePage';
import MyNFTsPage from './pages/MyNFTsPage';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="camera" element={<CameraPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/followers" element={<FollowersPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="nft/marketplace" element={<NFTMarketplacePage />} />
            <Route path="nft/my-nfts" element={<MyNFTsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;