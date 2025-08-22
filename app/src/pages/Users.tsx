export const Users = () => {
  return (
   <table className="border-separate border border-gray-400 ...">
  <thead>
    <tr>
      <th className="border border-gray-300 ...">State</th>
      <th className="border border-gray-300 ...">City</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-gray-300 ...">Indiana</td>
      <td className="border border-gray-300 ...">Indianapolis</td>
    </tr>
    <tr>
      <td className="border border-gray-300 ...">Ohio</td>
      <td className="border border-gray-300 ...">Columbus</td>
    </tr>
    <tr>
      <td className="border border-gray-300 ...">Michigan</td>
      <td className="border border-gray-300 ...">Detroit</td>
    </tr>
  </tbody>
</table>
  );
};
export default Users;
