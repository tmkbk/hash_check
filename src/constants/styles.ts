export const buttonBaseStyle = 'focus:outline-none focus:ring-0';

export const selectBaseStyle = `
  ${buttonBaseStyle}
  appearance-none
  bg-white
  border border-gray-200
  text-gray-700
  px-3 py-1.5
  pr-8
  rounded-md
  cursor-pointer
  transition-all
  hover:border-blue-300
  focus:border-blue-400
  disabled:opacity-50
  disabled:cursor-not-allowed
  bg-[url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236B7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')] 
  bg-[length:20px_20px]
  bg-no-repeat
  bg-[center_right_0.5rem]
`;

export const copySuccessStyle = `
  absolute right-full top-1/2 -translate-y-1/2 mr-2
  flex items-center
  bg-green-50 text-green-600
  border border-green-200
  rounded-md px-2 py-1
  text-xs
  shadow-sm
  whitespace-nowrap
  z-10
`;
