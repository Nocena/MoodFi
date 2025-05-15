import React, {useRef, useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {Camera} from 'lucide-react';
import {useLensAuth} from "../../providers/LensAuthProvider.tsx";
import {uploadMediaToGrove, uploadMetadataToGrove} from "../../utils/grove.utils.ts";
import {account as accountMetadata} from "@lens-protocol/metadata";
import {setAccountMetadata} from "@lens-protocol/client/actions";
import {uri} from "@lens-protocol/client";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const {currentAccount, refreshCurrentAccount, client} = useLensAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentAccount?.displayName || '',
    bio: currentAccount?.bio || '',
  });

  const [avatar, setAvatar] = useState<string | null>(currentAccount?.avatar || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!avatar) {
      newErrors.avatar = 'Profile picture is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const avatarURI = await uploadMediaToGrove(fileInputRef.current.files[0])
      const metadata = accountMetadata({
        name: formData.name,
        bio: formData.bio,
        picture: avatarURI.uri,
      });
      const metadataURI = await uploadMetadataToGrove(metadata);
      await setAccountMetadata(client!, {
        metadataUri: uri(metadataURI.uri),
      });
      await refreshCurrentAccount()

      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.log("error", error)
      toast({
        title: 'Error updating profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={6}>
              <FormControl isInvalid={!!errors.avatar}>
                <VStack spacing={2}>
                  <Avatar
                      size="2xl"
                      src={avatar || undefined}
                      name={formData.name}
                      cursor="pointer"
                      onClick={handleAvatarClick}
                  />
                  <Box position="relative">
                    <IconButton
                        aria-label="Change avatar"
                        icon={<Camera size={18} />}
                        onClick={handleAvatarClick}
                        size="sm"
                        colorScheme="brand"
                        borderRadius="full"
                        position="absolute"
                        bottom={0}
                        right={-6}
                    />
                  </Box>
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                  />
                  <FormErrorMessage>{errors.avatar}</FormErrorMessage>
                </VStack>
              </FormControl>

              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your display name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    resize="vertical"
                    rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
                colorScheme="brand"
                onClick={handleSubmit}
                isLoading={isLoading}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default EditProfileModal;