import React, { useEffect, useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface Props {
  onSearch: (q: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<Props> = ({ onSearch, placeholder = 'Buscar películas...' }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const id = setTimeout(() => onSearch(value.trim()), 400);
    return () => clearTimeout(id);
  }, [value, onSearch]);

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      size="small"
      sx={{ backgroundColor: '#fff', borderRadius: 1 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setValue('')} aria-label="clear">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
