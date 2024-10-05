import { styled } from '@mui/material';

interface Props {
  login: string;
  avatarUrl: string;
}
const UserRow = ({ login, avatarUrl }: Props) => {
  return (
    <Wrapper>
      <Avatar src={avatarUrl} />
      {login}
    </Wrapper>
  );
};

export default UserRow;

const Wrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '5px 0',
});

const Avatar = styled('img')({
  height: '30px',
  width: '30px',
  borderRadius: '15px',
});
