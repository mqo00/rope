'use client'

import * as React from 'react';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import useLocalStorageState from "use-local-storage-state";
// The default page is for sign up
export default function Signup(props) {

    const [username, setUsername] = useLocalStorageState("username", {
        defaultValue: "",
      });
    const [password, setpassword] = React.useState('')


    const redirect
        = () => {
            // const attributes = {
            //     password: password,
            //     username: username,
            // };
            // const queryString = new URLSearchParams(attributes).toString();
            // router.push(`/whiteboard?${queryString}`);
            if(!username) return alert('Please enter username')
            props.login(true)
        };

    return (
        <Box sx={{
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
            m: 0
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }}>
                <Box
                    sx={{
                        width: 500,
                        py: 3, // padding top & bottom
                        px: 2, // padding left & right
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderRadius: 'sm',
                        boxShadow: 'md',
                    }}
                    variant="outlined"
                >
                    <div>
                        <Typography level="h4" component="h1">
                            <b>Welcome!</b>
                        </Typography>
                        <Typography level="body-sm">Enter information to continue.</Typography>
                    </div>
                    <FormControl>
                        <FormLabel>Subject ID</FormLabel>
                        <Input
                            // html input attribute
                            name="Subject ID"
                            required
                            value={username}
                            onChange={(e) => {setUsername(e.target.value)}}
                            type="username"
                            placeholder="Subject ID"
                        />
                    </FormControl>
                    <Button sx={{ mt: 1 }} onClick={()=>{redirect()} }>login</Button>
                </Box>
            </Box>
        </Box>
    );
}