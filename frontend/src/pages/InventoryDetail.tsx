import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { inventoriesService } from '../services/inventories';

export default function InventoryDetail() {
  const { id = '' } = useParams();
  const [data, setData] = useState<any>();
  const load = () => inventoriesService.get(id).then(setData);
  useEffect(() => {
  load();
}, [id]);
  if (!data) return <p>Loading...</p>;
  const update = async (item:any, value:number) => { await inventoriesService.updateItem(id, item.id, value); load(); };
  return <div><div className="d-flex justify-content-between mb-4"><h2>{data.inventory_number}</h2>
    {data.status !== 'VALIDATED' && <button className="btn btn-success" onClick={async()=>{await inventoriesService.validate(id);load();}}>Validate inventory</button>}</div>
    <div className="card shadow-sm"><div className="table-responsive"><table className="table mb-0">
      <thead><tr><th>Article</th><th>Theoretical</th><th>Physical</th><th>Difference</th><th></th></tr></thead>
      <tbody>{data.items.map((i:any)=><tr key={i.id}><td>{i.article_id}</td><td>{i.theoretical_quantity}</td><td><input className="form-control" type="number" min="0" defaultValue={i.physical_quantity} disabled={data.status==='VALIDATED'} onBlur={e=>update(i, Number(e.target.value))}/></td><td className={i.difference===0?'':'fw-bold'}>{i.difference}</td><td>{i.difference===0?'OK':<span className="badge bg-warning text-dark">ADJUST</span>}</td></tr>)}</tbody>
    </table></div></div>
  </div>;
}
