// services/contract.service.ts
import { Contract, Employee } from '@models';
import * as Docx from 'docx';
import { Packer } from 'docx';
import fs from 'fs';

export default class ContractService {
  static async list({ page = 1, pageSize = 20 }) {
    const offset = (Number(page) - 1) * Number(pageSize);

    const { rows, count } = await Contract.findAndCountAll({
      include: [Employee],
      offset,
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows || [],
      total: count || 0,
    };
  }

  static async get(id: number) {
    return Contract.findByPk(id, { include: [Employee] });
  }

  static async create(payload: any) {
    return Contract.create(payload);
  }

  static async update(id: number, payload: any) {
    const c = await Contract.findByPk(id);
    if (!c) throw new Error('Contract not found');
    return c.update(payload);
  }

  static async remove(id: number) {
    const c = await Contract.findByPk(id);
    if (!c) throw new Error('Contract not found');
    await c.destroy();
    return { ok: true };
  }

  static async exportWord(id: number) {
    const contract = await Contract.findByPk(id, { include: [Employee] });
    if (!contract) throw new Error('Contract not found');

    const doc = new Docx.Document({
      sections: [
        {
          children: [
            new Docx.Paragraph({
              text: 'HỢP ĐỒNG LAO ĐỘNG',
              heading: Docx.HeadingLevel.TITLE,
            }),
            new Docx.Paragraph(`Nhân viên: ${contract.employee?.full_name}`),
            new Docx.Paragraph(`Loại HĐ: ${contract.contract_type}`),
            new Docx.Paragraph(
              `Thời gian: ${contract.start_date} - ${contract.end_date}`
            ),
            new Docx.Paragraph(`Lương: ${contract.salary} VNĐ`),
            new Docx.Paragraph(`Trạng thái: ${contract.status}`),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = `exports/contract_${id}.docx`;
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }
}
