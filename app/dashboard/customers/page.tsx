export default async function Page(){
    await new Promise((resolve) => setTimeout(resolve, 4000))
    return (<p className="text-blue-500">Customers page</p>)
}