// 1. ตั้งค่าการเชื่อมต่อ Supabase
const { createClient } = supabase;
const SUPABASE_URL = "https://aworywayyxstysdaiqlx.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_QqFOGSypuY7yIbON6oAGvQ_SJfZ-rdi";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. ดึงข้อมูลรายการยืมหนังสือ (Read)
async function fetchTasks() {
  const searchKeyword = document.getElementById("searchInput").value.trim();
  let query = db.from("tasks").select("*").order("id", { ascending: false });

  if (searchKeyword) {
    query = query.ilike("title", `%${searchKeyword}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch error:", error);
    return;
  }

  renderTable(data);
}

// 3. แสดงผลลงตาราง
function renderTable(tasks) {
  const tbody = document.getElementById("taskTableBody");
  tbody.innerHTML = "";

  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">ไม่พบรายการหนังสือ</td></tr>';
    return;
  }

  tasks.forEach(task => {
    const isDone = task.is_done; // true = คืนแล้ว, false = ยืมอยู่
    const statusBadge = isDone 
      ? '<span class="badge status-done">คืนแล้ว</span>' 
      : '<span class="badge status-pending">ยืมอยู่</span>';
    
    const titleStyle = isDone ? 'class="title-done"' : '';
    const dueDate = task.due_date ? task.due_date : '-';

    const row = `
      <tr>
        <td>${task.id}</td>
        <td ${titleStyle}><strong>${task.title}</strong></td>
        <td>${dueDate}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-toggle" onclick="toggleTaskStatus(${task.id}, ${!isDone})">
            ${isDone ? 'ยืมอีกครั้ง' : 'คืนหนังสือ'}
          </button>
          <button class="btn btn-delete" onclick="deleteTask(${task.id})">ลบ</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// 4. เพิ่มรายการยืมหนังสือใหม่ (Create / Commit to System)
async function addTask(event) {
  event.preventDefault();
  const title = document.getElementById("newTitle").value;
  const dueDate = document.getElementById("newDueDate").value;

  const { error } = await db.from("tasks").insert([
    { 
      title: title, 
      due_date: dueDate || null, 
      is_done: false 
    }
  ]);

  if (error) {
    alert("เกิดข้อผิดพลาด: " + error.message);
    console.error("Insert error:", error);
  } else {
    document.getElementById("addForm").reset();
    fetchTasks();
  }
}

// 5. สลับสถานะ ยืมอยู่ <-> คืนแล้ว (Update)
async function toggleTaskStatus(id, newStatus) {
  const { error } = await db
    .from("tasks")
    .update({ is_done: newStatus })
    .eq("id", id);

  if (error) {
    alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ: " + error.message);
    console.error("Update error:", error);
  } else {
    fetchTasks();
  }
}

// 6. ลบรายการยืม (Delete)
async function deleteTask(id) {
  if (!confirm("คุณต้องการลบรายการยืมหนังสือนี่ใช่หรือไม่?")) return;

  const { error } = await db.from("tasks").delete().eq("id", id);

  if (error) {
    alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
    console.error("Delete error:", error);
  } else {
    fetchTasks();
  }
}

// โหลดข้อมูลครั้งแรกเมื่อเปิดหน้าเว็บ
fetchTasks();
