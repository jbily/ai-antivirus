import React, { useState, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface IpAddressInputProps {
  onIpAddressesChange: (ipAddresses: string[]) => void;
  className?: string;
}

const IpAddressInput: React.FC<IpAddressInputProps> = ({ onIpAddressesChange, className }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);

  // Basic IP or CIDR validation
  const isValidIpOrCidr = (value: string): boolean => {
    // IPv4 regex pattern
    const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // CIDR notation pattern
    const cidrPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[1-2][0-9]|[0-9])$/;
    
    return ipv4Pattern.test(value) || cidrPattern.test(value);
  };

  const addIpAddress = () => {
    if (inputValue.trim() && isValidIpOrCidr(inputValue.trim())) {
      const newIpAddresses = [...ipAddresses, inputValue.trim()];
      setIpAddresses(newIpAddresses);
      onIpAddressesChange(newIpAddresses);
      setInputValue('');
    }
  };

  const removeIpAddress = (index: number) => {
    const newIpAddresses = ipAddresses.filter((_, i) => i !== index);
    setIpAddresses(newIpAddresses);
    onIpAddressesChange(newIpAddresses);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIpAddress();
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault();
      addIpAddress();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('ipInput.placeholder')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button 
          type="button" 
          onClick={addIpAddress}
          disabled={!inputValue.trim() || !isValidIpOrCidr(inputValue.trim())}
        >
          {t('ipInput.addMore')}
        </Button>
      </div>
      
      {ipAddresses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ipAddresses.map((ip, index) => (
            <div 
              key={`${ip}-${index}`}
              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
            >
              <span>{ip}</span>
              <button
                type="button"
                onClick={() => removeIpAddress(index)}
                className="text-secondary-foreground/70 hover:text-secondary-foreground focus:outline-none"
                aria-label={t('ipInput.remove')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IpAddressInput;
