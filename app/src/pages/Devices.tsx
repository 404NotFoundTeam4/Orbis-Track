import MainDeviceModal from "../components/DeviceModal";


export default function Devices() {
  

  const handleSubmit = (data: any) => {
        console.log(data)
  };

  return (
    <div>
        <MainDeviceModal
          mode="create"
          onSubmit={(data) => {
            handleSubmit(data);
          }}
        />
    </div>
  );
}
