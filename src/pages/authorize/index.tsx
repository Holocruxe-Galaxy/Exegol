// ** React Imports
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// ** MUI Components
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout';

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}));

const Authorize = () => {
  const [response, setResponse] = useState();
  const searchParams = useSearchParams();
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('static props', response);
  }, [response]);

  const handleName = (e: any) => {
    if (keyRef?.current) keyRef.current.value = e.target.value;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = searchParams.get('code');

    if (!keyRef?.current?.value) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACK}/admin/code`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        code,
        password: keyRef.current?.value.toUpperCase()
      })
    });

    setResponse(await res.json());

    // navigator.clipboard.writeText('hi');
  };

  return (
    <Box className='content-center'>
      <Box
        sx={{
          p: 7,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper'
        }}
      >
        <BoxWrapper>
          <Box
            sx={{
              top: 30,
              left: 40,
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
          </Box>
          <form noValidate autoComplete='off' onSubmit={e => onSubmit(e)}>
            <TextField
              ref={keyRef}
              onChange={(e) => handleName(e)}
              autoFocus
              fullWidth
              sx={{ mb: 4 }}
              label='Ingrese su clave'
              placeholder='Clave'
            />
            <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
              Autorizar
            </Button>
          </form>
        </BoxWrapper>
      </Box>
    </Box>
  );
};

Authorize.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>;

Authorize.guestGuard = true;

export default Authorize;
